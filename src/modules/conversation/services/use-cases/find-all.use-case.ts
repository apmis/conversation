import { Injectable } from "@nestjs/common";
import { FilterQuestionDto } from "../../controllers/dto/filter-question.dto";
import { QuestionRepository } from "../../repositories/question.repository";

@Injectable()
export class FindAllQuestionUseCase {
  constructor(private readonly repo: QuestionRepository) {}

  execute(filter: FilterQuestionDto) {
    return this.repo.findAll(filter);
  }
}