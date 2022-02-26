import { Entity, Column, PrimaryGeneratedColumn, Timestamp, CreateDateColumn } from 'typeorm';
import { deprecate } from 'util';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference_id: number;

  @Column()
  username: string;

  @Column()
  access_token_42: string;

  @Column({nullable: true})
  access_token_google?: string;

  @CreateDateColumn({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
  creation_date: Date;

  /*@Column()
  avatar_id: 
  // TODO : create entity databasefile for avatar_id 
  */
 
  @Column({default: true})
  is_connected: boolean;

  //TODO : create nb_won, nb_lose,block_list,friend_list


}
