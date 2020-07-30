const payments = [
    {
      'PaymentId': 1,
      'ContactName': 'Nancy Davolio',
      'CompanyName': 'Premier Buy',
      'Amount': 1740.20,
      'PaymentDate': '2020-07-29T00:00:00.000Z'
    }
    ];
  
  const locales = [
    {
      'Name': 'English',
      'Value': 'en'
    },
    {
      'Name': 'Deutsch',
      'Value': 'de'
    },
    {
      'Name': 'Русский',
      'Value': 'ru'
    }
  ];
  
  const dictionary = {
    'en': {
      'Number': 'Number',
      'Contact': 'Contact',
      'Company': 'Company',
      'Amount': 'Amount',
      'PaymentDate': 'Payment Date'
    },
    'de': {
      'Number': 'Nummer',
      'Contact': 'Ansprechpartner',
      'Company': 'Firma',
      'Amount': 'Betrag',
      'PaymentDate': 'Zahlungsdatum'
    },
    'ru': {
      'Number': 'Номер',
      'Contact': 'Имя',
      'Company': 'Организация',
      'Amount': 'Сумма',
      'PaymentDate': 'Дата оплаты'
    }
  };
  
  export default {
    getPayments() {
      return payments;
    },
    getLocales() {
      return locales;
    },
    getDictionary() {
      return dictionary;
    }
  };
  