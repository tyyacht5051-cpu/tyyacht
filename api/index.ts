import app from './app';
import { config } from './src/config/env';

app.listen(config.PORT, () => {
    console.log(`✅ API Server is ready and listening on port ${config.PORT}`);
    console.log(`🌐 Access URL: http://localhost:${config.PORT}`);
});
