import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class User
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference_id: number;

  @Column()
  username: string;



  // all tokens are nullable because we dont want to keep an expired token
  @Column({nullable: true})
  access_token_42?: string;

  @Column({nullable: true})
  refresh_token_42?: string;

  // created at actual date then adds the expiration time
  @CreateDateColumn({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
  token_expiration_date_42?: Date;

  @Column({nullable: true})
  access_token_google?: string;

  @Column({default: true})
  is_connected: boolean;

  @CreateDateColumn({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
  creation_date: Date;



  /*@Column()
  avatar_id: 
  // TODO : create entity databasefile for avatar_id 
  */

  //TODO : create nb_won, nb_lose,block_list,friend_list
}
