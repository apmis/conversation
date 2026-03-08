import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AiProcessor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  modelName: string;

  @Column({ type: 'decimal', default: 0.7 })
  temperature: number;

  @Column({ type: 'text', nullable: true })
  systemPrompt: string;

  @Column({ type: 'json', nullable: true })
  configJson: any;

  @Column({ default: true })
  isActive: boolean;
}