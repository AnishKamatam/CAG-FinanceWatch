import axios from 'axios';

async function testCAG() {
  try {
    console.log('🤖 Testing CAG advice...');
    const response = await axios.post('http://localhost:3000/api/advice', {
      userId: 'test-user',
      userInput: 'How are my spending habits? What can I improve?'
    });

    console.log('\n✅ CAG Analysis:');
    console.log(response.data.advice);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testCAG(); 