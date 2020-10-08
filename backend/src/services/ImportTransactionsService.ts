import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import CreateTransactionService from './CreateTransactionService';

interface RequestDTO {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: RequestDTO): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, filename);

    const fileExists = await fs.promises.stat(filePath);

    if (!fileExists) {
      throw new AppError('File does not exists.', 200);
    }

    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: Array<string[]> = [];

    parseCSV.on('data', (line: string[]) => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    await fs.promises.unlink(filePath);

    const createTransaction = new CreateTransactionService();

    const importedTransactions = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const line of lines) {
      const [title, type, value, category] = line;

      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransaction.execute({
        title,
        type: type as 'income' | 'outcome',
        category,
        value: Number(value),
      });

      importedTransactions.push(transaction);
    }

    return importedTransactions;
  }
}

export default ImportTransactionsService;
