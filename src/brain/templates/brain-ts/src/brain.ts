import {
  BrainPromptResponse,
  IBrainService,
  IAudioTranscriberBrainService,
  ITextBrainService,
  LocalAudioPrompt,
  TextBrainPrompt,
  IBrainPromptContext,
  BrainSettingsValidationResult,
  IImageGenerationBrainService,
  ImageGenerationBrainPrompt,
} from '@hubai/brain-sdk';

/* Example of setting required by this brain */
export interface ISettings {
  test?: string;
  /* Use will be able to change this parameter on chat window */
  scopedTest?: string;
}

/* If your brain does not support AudioTranscription just remove the interface implementation */
export default class MyBrainService
  implements
    IBrainService,
    ITextBrainService<ISettings>,
    IAudioTranscriberBrainService<ISettings>,
    IImageGenerationBrainService<ISettings>
{
  async transcribeAudio(
    prompt: LocalAudioPrompt,
    context: IBrainPromptContext<ISettings>,
  ): Promise<BrainPromptResponse> {
    const validationResult = this.validateSettings(context.settings);

    return {
      result: 'This is the prompt result using the language:' + prompt.language,
      validationResult,
    };
  }

  sendTextPrompt(
    prompts: TextBrainPrompt[],
    context: IBrainPromptContext<ISettings>,
  ): Promise<BrainPromptResponse> {
    const validationResult = this.validateSettings(context.settings);

    return Promise.resolve({
      result: 'Text prompt received:\n ``json \n' + JSON.stringify(prompts) + '\n``',
      validationResult,
    });
  }

  generateImage(
    prompts: ImageGenerationBrainPrompt[],
    context: IBrainPromptContext<ISettings>,
  ): Promise<BrainPromptResponse> {
    const validationResult = this.validateSettings(context.settings);

    return Promise.resolve({
      result: 'Image prompt received:\n ``json \n' + JSON.stringify(prompts) + '\n``',
      validationResult,
    });
  }

  validateSettings(settings: ISettings): BrainSettingsValidationResult {
    const validation = new BrainSettingsValidationResult();

    /* Example of settings validation */
    if (!settings.test) validation.addFieldError('test', 'Cannot be empty');

    if (settings.scopedTest && settings.scopedTest.length < 5)
      validation.addFieldError(
        'scopedTest',
        'Must be at least 5 characters long',
      );

    return validation;
  }
}
