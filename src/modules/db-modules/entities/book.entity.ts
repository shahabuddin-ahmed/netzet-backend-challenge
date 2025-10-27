import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  RelationId,
} from 'typeorm';
import { Author } from './author.entity';

@Entity({ name: 'books' })
export class Book {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  title!: string;

  // Keep formatted ISBN-13 like "978-3-16-148410-0"
  @Index({ unique: true })
  @Column({ type: 'varchar' })
  isbn!: string;

  @Column({ type: 'date', nullable: true })
  publishedDate?: string | Date;

  @Column({ type: 'varchar', nullable: true })
  genre?: string;

  @ManyToOne(() => Author, (author) => author.books, {
    nullable: false,
    onDelete: 'RESTRICT', // prevent deleting an author that still has books
  })
  @JoinColumn({ name: 'authorId' })
  author!: Author;

  // Handy read-only FK field for DTOs/queries
  @RelationId((book: Book) => book.author)
  authorId!: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
