import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot(
      'mongodb+srv://itudict:koWwJl32wwYK86jx@cluster0.opq8fwd.mongodb.net/?retryWrites=true&w=majority',
    ),
    ConfigModule.forRoot(), // load and parse .env file
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
