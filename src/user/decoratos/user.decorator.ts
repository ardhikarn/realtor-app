import { createParamDecorator, ExecutionContext} from "@nestjs/common"

export interface User { 
  name: string;
  id: number;
  iat: number;
  exp: number
}
// createParamDecorator is a function that takes a function as an argument
export const User = createParamDecorator((data, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})