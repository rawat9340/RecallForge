import { Router, Request, Response, NextFunction } from 'express';
import { GenerateRequestSchema } from '../schemas/studySchema';
import { generateStudySetFromLLM } from '../services/llmService';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/study/generate
 * Generates a structured study set (flashcards + quiz) from user study notes or topic.
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validate incoming request payload using Zod
    const parseResult = GenerateRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorDetails = parseResult.error.errors.map((e) => e.message).join(', ');
      throw new AppError(
        'VALIDATION_ERROR',
        `Invalid request: ${errorDetails}`,
        400,
        parseResult.error.format()
      );
    }

    // 2. Query Gemini LLM, parse response, and validate schema with Zod
    const studySet = await generateStudySetFromLLM(parseResult.data);

    // 3. Return validated study set to client
    res.status(200).json(studySet);
  } catch (error) {
    next(error);
  }
});

export default router;
