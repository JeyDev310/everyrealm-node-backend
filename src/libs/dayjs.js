import DayJs from 'dayjs'
import utc from 'dayjs/plugin/utc'

DayJs.extend(utc)

export const dayjs = DayJs.utc
