import { HttpException, HttpStatus } from '@nestjs/common';

export class WrongItuEmail extends HttpException {
  constructor() {
    super('Not an Itu email', HttpStatus.BAD_REQUEST);
  }
}
