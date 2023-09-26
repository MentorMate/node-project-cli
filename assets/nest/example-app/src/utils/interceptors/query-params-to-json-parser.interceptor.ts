import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class QueryParamsToJsonParser implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { query } = context.switchToHttp().getRequest();

    this.queryValuesToJSON(query);

    return next.handle();
  }

  private queryValuesToJSON(query: any): void {
    Object.keys(query).forEach((key) => {
      const queryValue = query[key];

      if (Array.isArray(queryValue)) {
        queryValue.forEach((value, idx) => {
          queryValue[idx] = this.stringToJSON(value);
        });
      } else {
        query[key] = this.stringToJSON(queryValue);
      }
    });
  }

  private stringToJSON(value: string) {
    if (value.length) {
      try {
        return JSON.parse(value);
      } catch (error) {
        return value;
      }
    }
  }
}
