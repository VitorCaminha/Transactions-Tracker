import Transaction from '../models/Transaction';

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Response {
  transactions: Transaction[];
  balance: Balance;
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Response {
    const { transactions } = this;

    const balance = this.getBalance();

    return { transactions, balance };
  }

  public getBalance(): Balance {
    const income = this.transactions.reduce((incomeSum, transaction) => {
      if (transaction.type === 'income') {
        return incomeSum + transaction.value;
      }

      return incomeSum;
    }, 0);

    const outcome = this.transactions.reduce((outcomeSum, transaction) => {
      if (transaction.type === 'outcome') {
        return outcomeSum + transaction.value;
      }

      return outcomeSum;
    }, 0);

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }

  public create({ value, type, title }: CreateTransactionDTO): Transaction {
    const transaction = new Transaction({ title, type, value });

    this.transactions.push(transaction);

    return transaction;
  }
}

export default TransactionsRepository;
