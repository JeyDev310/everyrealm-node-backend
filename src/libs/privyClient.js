import { PrivyClient } from '@privy-io/server-auth';
import { config } from '@src/configs/config';

export const privy = new PrivyClient(config.get('privy.privyAppId'), config.get('privy.privyAppSecret'));
