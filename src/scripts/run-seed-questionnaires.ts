import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { seedQuestionnaires } from './seed-questionnaires';

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const result = await seedQuestionnaires(app);
    console.log(
      `Questionnaire seeding complete. created=${result.created} skipped=${result.skipped}`,
    );
  } finally {
    await app.close();
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Questionnaire seed runner failed:', error);
    process.exit(1);
  });
