import { getTopChartsByRegions } from './src/itunes.js';

console.log('Testing iTunes charts API...');

getTopChartsByRegions()
  .then(result => {
    console.log('Success! Available regions:', Object.keys(result));
    console.log('USA tracks:', result.USA?.length || 0);
    console.log('India tracks:', result['India (Bollywood)']?.length || 0);
    
    if (result['India (Bollywood)']?.length > 0) {
      console.log('Sample India track:', {
        title: result['India (Bollywood)'][0].title,
        artist: result['India (Bollywood)'][0].artist,
        genre: result['India (Bollywood)'][0].genre
      });
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
