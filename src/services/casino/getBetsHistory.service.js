import { APIError } from '@src/errors/api.error'
import { alignDatabaseDateFilter } from '@src/helpers/common.helper'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { LEDGER_PURPOSE } from '@src/utils/constants/public.constants.utils'
import { sequelize } from '@src/database'
import { Op } from 'sequelize'


const constraints = ajv.compile({
  type: 'object',
  properties: {   
    userId: { type: 'string' },
    type: {type: 'string'}
  }
})

export class GetBetsHistoryService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    // const limit = this.args.limit
    // const pageNo = this.args.pageNo
    // const offset = (pageNo - 1) * limit;

    try {  
      
      let rounds = [];    
      if(this.args.type == 'my-betting' && this.args.userId != undefined) {
        rounds = await this.context.sequelize.models.casinoTransaction.findAll({  
          attributes: [  
              'round_id',  
              [sequelize.fn('MIN', sequelize.col('id')), 'min_id'],  
              [sequelize.fn('MAX', sequelize.col('id')), 'max_id'],  
              [sequelize.fn('COUNT', sequelize.col('round_id')), 'round_count'],            
          ],  
          group: 'round_id',  
          where: {user_id: this.args.userId},
          order: [[sequelize.fn('MAX', sequelize.col('created_at')), 'DESC']],
          limit: 10,
          raw:true
        }); 
      }
      else if(this.args.type == 'big-wins') {
        rounds = await this.context.sequelize.models.casinoTransaction.findAll({  
          attributes: [  
              'round_id',  
              [sequelize.fn('MIN', sequelize.col('id')), 'min_id'],  
              [sequelize.fn('MAX', sequelize.col('id')), 'max_id'],  
              [sequelize.fn('COUNT', sequelize.col('round_id')), 'round_count']  
          ],  
          group: 'round_id',  
          having: sequelize.where(sequelize.fn('COUNT', sequelize.col('round_id')), '=', 2),  
          order: [[sequelize.fn('MAX', sequelize.col('created_at')), 'DESC']],
          limit: 1000,
          raw:true
        }); 
      }
      else {
        rounds = await this.context.sequelize.models.casinoTransaction.findAll({  
          attributes: [  
              'round_id',  
              [sequelize.fn('MIN', sequelize.col('id')), 'min_id'],  
              [sequelize.fn('MAX', sequelize.col('id')), 'max_id'],  
              [sequelize.fn('COUNT', sequelize.col('round_id')), 'round_count']  
          ],  
          group: 'round_id',  
          order: [[sequelize.fn('MAX', sequelize.col('created_at')), 'DESC']],
          limit: 1000,
          raw:true
        }); 
      }

      const winObj = {};
      const minIds = rounds.map(t => {
        winObj[t['min_id']] = [t['max_id'], t['round_count']];
        return t["min_id"];
      });  

      const whereHigh = {};
      if (this.args.type == "high-rollers") {  
        whereHigh.fiat_amount = {[Op.gte]: 5};  
      }  
  
      const transactions = await this.context.sequelize.models.casinoTransaction.findAll({  
        attributes: ['id', 'transaction_id', 'user_id', 'game_id', 'status'], 
        where:{
          id:{[Op.in]: minIds}
        },
        include: [{  
          model: this.context.sequelize.models.ledger,  
          attributes: ['purpose', 'amount', 'currency_id', 'fiat_amount'],  
          where: whereHigh  
        }],  
        raw: true,  
        order: [['created_at', 'desc']]
      });  
      
      const userIds = transactions.map(t => t["user_id"]);  
      const gameIds = transactions.map(t => t["game_id"]);  
      const currencyIds = transactions.map(t => t["ledger.currency_id"]);  
     
      // Batch fetching related data  
      const [games, currencies, users] = await Promise.all([  
        this.context.sequelize.models.casinoGame.findAll({  
            where: { id: { [Op.in]: gameIds } },  
            raw: true  
        }),  
        this.context.sequelize.models.currency.findAll({  
            where: { id: { [Op.in]: currencyIds } },  
            raw: true  
        }),  
        this.context.sequelize.models.user.findAll({  
            where: { id: { [Op.in]: userIds } },  
            raw: true  
        })  
      ]);        
      
      // Maps for quick lookup  
      const gameMap = new Map(games.map(game => [game.id.toString(), game.name]));  
      const currencyMap = new Map(currencies.map(currency => [currency.id.toString(), currency]));  
      const userMap = new Map(users.map(user => [user.id.toString(), user.username]));  
      const result = [];
      // Process transactions  
      for (let transaction of transactions) {  
        const gameId = transaction["game_id"] ? transaction["game_id"].toString() : null;  
        const currencyId = transaction["ledger.currency_id"] ? transaction["ledger.currency_id"].toString() : null;  
        const userId = transaction["user_id"] ? transaction["user_id"].toString() : null;  
      
        // Fetch values from the maps using the keys if they exist  
        const gameName = gameId ? gameMap.get(gameId) : null;  
        const currency = currencyId ? currencyMap.get(currencyId) : null;  
        const userName = userId ? userMap.get(userId) : null;  
        
        if(gameName == null) {
          continue;
        }

        const betAmount =  transaction["ledger.amount"] ? transaction["ledger.amount"] : 0;      
        const tid = transaction['id'];     
        const fiatAmount = transaction["ledger.fiat_amount"] ? transaction["ledger.fiat_amount"] : 0;
        const winId = winObj[tid] && winObj[tid][0] ? winObj[tid][0] : null;  

        let winAmount = 0;
        let winFiatAmount = 0;
        if(tid != winId && winId ) {
          const winRecord = await this.context.sequelize.models.casinoTransaction.findOne({
            where:{
              id: winId
            },
            include: [{  
              model: this.context.sequelize.models.ledger,  
              attributes: ['purpose', 'amount', 'currency_id', 'fiat_amount'],               
            }], 
            raw:true
          });
          winAmount = winRecord["ledger.amount"] || 0;
          winFiatAmount = winRecord["ledger.fiat_amount"] || 0;
        }
        
        if (this.args.type == "big-wins") {            
          if(winAmount < betAmount * 2) {
            continue;  
          }
        }  
        
        result.push({  
          tid: tid,  
          name: gameName,  
          username: userName,  
          symbol: currency ? currency.symbol : 'N/A',  
          code: currency ? currency.code : 'N/A', 
          bet: betAmount,  
          purpose: transaction["ledger.purpose"] ? transaction["ledger.purpose"] : 'N/A', 
          fiatAmount: fiatAmount,
          win: winAmount,
          winFiatAmount
        });  
  
        if (result.length >= 10) break;  
      }  
  
      return {  
        history: {  
          rows: result,  
          count: result.length  
        }  
      };  
    } catch (error) {  
      throw new APIError(error);  
    }
  }
}
