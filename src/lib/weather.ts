export type WeatherData = {
    temperature: number;
    humidity: number;
    rainfall: number; // in mm
};

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("NEXT_PUBLIC_OPENWEATHER_API_KEY is not set in .env file.");
    return null;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url, { cache: 'no-store' }); // Disable caching for live weather
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to fetch weather data: ${response.status} ${response.statusText}`, errorBody);
      return null;
    }

    const data = await response.json();

    return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        rainfall: data.rain?.['1h'] ?? 0,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}
