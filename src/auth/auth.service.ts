import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

import * as bcryptjs from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-paylod';
import { LoginResponse } from './interfaces/login-response';
import { RegisteruserDto, LoginDto, CreateuserDto, UpdateAuthDto } from './dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) { }

  async create(createuserDto: CreateuserDto): Promise<User> {


    try {
      const { password, ...userData } = createuserDto
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      })

      await newUser.save()
      const { password: _, ...user } = newUser.toJSON()

      return user

    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${createuserDto.email} already exists|`)
      }
      throw new InternalServerErrorException('Somethig terrible happen!!!')
    }

  }

  async register(registerDto: RegisteruserDto): Promise<LoginResponse> {
    const user = await this.create(registerDto)

    if (!user._id) {
      throw new Error('El usuario no tiene id asignado')
    }

    return {
      user,
      token: this.getJwtToken({ id: user._id })
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {

    const { email, password } = loginDto

    const user = await this.userModel.findOne({ email })
    if (!user || !user.password) {
      throw new UnauthorizedException('Not valid credentials - email')
    }
    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials - password')
    }

    const { password: _, ...rest } = user.toJSON()

    return {
      user: rest,
      token: this.getJwtToken({ id: user.id })
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id)

    if (!user) {
      return null
    }

    const { password, ...rest } = user?.toJSON()
    return rest
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload) {

    const token = this.jwtService.sign(payload)
    return token
  }
}
