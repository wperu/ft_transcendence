import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, OneToOne, Unique } from 'typeorm';
import DatabaseFile from './databaseFile.entity';

@Entity()
@Unique('username', ['username'])
export class User
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference_id: number;


  @Column({nullable: true, default: null})
  login: string;

  @Column({nullable: false})
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
//   @JoinColumn({ name: 'avatarId' })
//   @OneToOne(
//     () => DatabaseFile,
//     {
//       nullable: true
//     }
//   )
//   public avatar?: DatabaseFile;
 
//   @Column({ nullable: true })
//   public avatarId?: number;

  //TODO : create nb_won, nb_lose,block_list,friend_list
}
