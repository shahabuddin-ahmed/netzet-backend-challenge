import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    healthCheck() {
        return 'Welcome to Netzet Backend API';
    }
}
