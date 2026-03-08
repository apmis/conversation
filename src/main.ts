import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './AllExceptionsFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new AllExceptionsFilter());


   const config = new DocumentBuilder()
    .setTitle('Conversation Engine API')
    .setDescription('Question & Option Management')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
