import { APP_PORT } from '@/config';
import app from './app';

app.listen(APP_PORT, () => {
  console.log(`Expenses Tracker API listening on port ${APP_PORT}`);
});
