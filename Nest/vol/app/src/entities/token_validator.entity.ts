import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TokenValidatorEntity
{
    @PrimaryGeneratedColumn()
    id: number;
    
    /* Associated code to safely deliver the token */
    @Column()
    code: string;

    /* Protected access token */
    @Column()
    token: string;
}