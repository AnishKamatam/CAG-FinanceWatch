export function generatePrompt(summary: string, userInput: string): string {
    return `
  You're a smart, friendly personal finance assistant.
  
  Here's what the user spent recently:
  ${summary}
  
  Now they asked:
  "${userInput}"
  
  Give helpful, personalized budgeting advice.
    `;
  }
  