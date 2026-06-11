import { ApiProperty } from '@nestjs/swagger';

export class CreateComponentDto {
  @ApiProperty({ example: 'Button', required: false })
  title?: string;

  @ApiProperty({
    example: 'button',
    enum: [
      'button', 'toggle', 'checkbox', 'card', 'loader',
      'input', 'form', 'pattern', 'radio', 'tooltip',
    ],
  })
  type: string;

  @ApiProperty({ example: '<button>Click</button>' })
  htmlCode: string;

  @ApiProperty({ example: 'button { color: red; }' })
  cssCode: string;

  @ApiProperty({ required: false }) reactCode?: string;
  @ApiProperty({ required: false }) vueCode?: string;
  @ApiProperty({ required: false }) litCode?: string;
  @ApiProperty({ required: false }) svelteCode?: string;

  @ApiProperty({ required: false }) accountId?: string;
  @ApiProperty({ required: false }) categoryId?: string;

  @ApiProperty({ example: 'draft', enum: ['draft', 'review', 'public', 'rejected'], required: false })
  status?: 'draft' | 'review' | 'public' | 'rejected';

  @ApiProperty({ example: 4.99, description: 'Sale price of the component', required: false })
  price?: number;
}
