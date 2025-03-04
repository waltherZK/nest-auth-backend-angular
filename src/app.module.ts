import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    MongooseModule.forRoot(process.env.MONGO_URI as string,
      {
        dbName: process.env.MONGO_DB_NAME
      }
    ),

    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { 

  constructor(){
    if (!process.env.MONGO_URI) {
      throw new Error('⚠️ ERROR: La variable de entorno MONGO_URI no está definida.');
    }
    console.log('MongoDB conectado con URI:', process.env.MONGO_URI);    
  }
}
