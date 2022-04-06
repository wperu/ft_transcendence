import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class JwtEntity
{
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    code: string;

    @Column()
    token: string;
}