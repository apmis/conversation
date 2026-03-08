import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateQuestionDto } from "../controllers/dto/create-question.dto";
import { FilterQuestionDto } from "../controllers/dto/filter-question.dto";
import { QuestionRepository } from "../repositories/question.repository";
import { CreateQuestionUseCase } from "./use-cases/create-question.use-case";
import { QuestionDomain } from "../../../shared/domain";
import { UpdateQuestionDto } from "../controllers/dto/update-question.dto";
import { QuestionMongoRepository } from "../repositories/mongo/question.mongorepo";
import { UpdateQuestionUseCase } from "./use-cases/update-question.use-case";
import { Question } from "../schemas/question.schema";
import { mapQuestionEntityToDomain } from "../../../shared/converters/question-converter";
import { AIQuestionConfig } from "../../../shared/domain/ai-question-config";
import { ValidationRule } from "../../../shared/domain/validation-rule.domain";
import { TagService } from "./tag.service";
import { OptionListService } from "./option-list.service";
import { Option } from "../schemas/option.schema";

@Injectable()
export class QuestionService {
  constructor(
    private readonly createUseCase: CreateQuestionUseCase,
    private readonly updateUseCase: UpdateQuestionUseCase,
    private readonly tagService: TagService,
    private readonly optionListService: OptionListService,
    private readonly repo: QuestionMongoRepository,
  ) { }

  async create(dto: CreateQuestionDto) {
    const domain: QuestionDomain = {
      ...dto,
      id: null as unknown as string,
      createdAt: null as unknown as Date,
      updatedAt: null as unknown as Date
    } //TODO: Create seperate domain type that omit this
    const question = await this.createUseCase.execute(domain);
    // Convert schema back to domain for response
    return mapQuestionEntityToDomain(question);
  }

  findAll(filter: FilterQuestionDto) {
    return this.repo.findAll(filter);
  }

  async findOne(id: string): Promise<QuestionDomain> {
    const schema = await this.repo.findById(id);
    if (!schema) throw new NotFoundException(`Question with id ${id} does not eist`)
    return mapQuestionEntityToDomain(schema);
  }

  async update(id: string, dto: UpdateQuestionDto): Promise<QuestionDomain> {

    const domain: Partial<QuestionDomain> = {
      ...dto,
      questionnaireId: dto.questionnaireId?.toString(),
      aiConfig: null as unknown as AIQuestionConfig,
      validationRules: null as unknown as ValidationRule[],
      options: dto.options?.map((option) => ({
        ...option
      }))
    }
    const question = await this.updateUseCase.execute(id, domain);
    return question;
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}