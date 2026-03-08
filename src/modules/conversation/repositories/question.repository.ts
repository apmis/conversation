import { QuestionDomain } from "../../../shared/domain";
import { FilterQuestionDto } from "../controllers/dto/filter-question.dto";
import { Question } from "../schemas/question.schema";

export abstract class QuestionRepository {
  abstract create(question: Question): Promise<Question>;
  abstract save(id: string, question: Partial<QuestionDomain>): Promise<QuestionDomain>;
  abstract findById(id: string): Promise<Question | null>;
  abstract findAll(filter: FilterQuestionDto): Promise<Question[]>;
  abstract delete(id: string): Promise<void>;
}