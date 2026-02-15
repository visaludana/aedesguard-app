'use server';

import { getWeatherData } from "@/lib/weather";
import { predictWeatherRisk } from "@/ai/flows/predict-weather-risk";
import { updateDistrictRisk } from "@/lib/db";
import type { District, DistrictRisk } from "@/lib/types";

export async function getDistrictRiskData(district: District): Promise<DistrictRisk | null> {
    const weather = await getWeatherData(district.lat, district.lng);
    if (!weather) {
      return null;
    }

    try {
      const riskPrediction = await predictWeatherRisk({
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainfall: weather.rainfall,
      });
      
      const newRiskData: DistrictRisk = {
        name: district.name,
        riskLevel: riskPrediction.riskLevel,
        assessment: riskPrediction.assessment,
        updatedAt: new Date().toISOString(),
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainfall: weather.rainfall,
      };

      // Not awaiting this, to make the client response faster
      updateDistrictRisk(district.name, newRiskData);

      return newRiskData;

    } catch (e) {
      console.error(`AI risk prediction failed for ${district.name}:`, e);
      return null;
    }
}
