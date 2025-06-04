import { getCepInfo } from "./cep";

const PIZZERIA_CITY = "Cotia";
const PIZZERIA_STATE = "SP";
const PIZZERIA_ZIP = "06705170";

const PIZZERIA_ADDRESS = {
  zip: PIZZERIA_ZIP,
  street: "Rua Norberto",
  neighborhood: "Vila Jovina",
  city: PIZZERIA_CITY,
  state: PIZZERIA_STATE,
};

const BASE_FEE = 8;
const FEE_PER_KM = 3;
const MAX_DELIVERY_RADIUS = 15;
const BASE_TIME_MINUTES = 30;
const TIME_PER_KM = 4;

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function calculateDelivery(zipDestination: string): Promise<{
  value: number;
  time: number;
  pizzeria: typeof PIZZERIA_ADDRESS;
  distanceKm?: number;
  error?: string;
}> {
  try {
    const destination = await getCepInfo(zipDestination);
    const origin = await getCepInfo(PIZZERIA_ZIP);

    if (
      destination?.localidade?.toUpperCase() !== PIZZERIA_CITY.toUpperCase() ||
      destination?.uf?.toUpperCase() !== PIZZERIA_STATE.toUpperCase()
    ) {
      return {
        value: 0,
        time: 0,
        pizzeria: PIZZERIA_ADDRESS,
        error: "We do not deliver outside " + PIZZERIA_CITY,
      };
    }

    const lat1 = parseFloat(origin?.lat || origin?.latitude || "0");
    const lon1 = parseFloat(origin?.lng || origin?.longitude || "0");
    const lat2 = parseFloat(destination?.lat || destination?.latitude || "0");
    const lon2 = parseFloat(destination?.lng || destination?.longitude || "0");

    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return calculateDeliveryByNeighborhood(destination?.bairro || "");
    }

    const distanceKm = haversine(lat1, lon1, lat2, lon2);

    if (distanceKm > MAX_DELIVERY_RADIUS) {
      return {
        value: 0,
        time: 0,
        pizzeria: PIZZERIA_ADDRESS,
        error: `We do not deliver to locations beyond ${MAX_DELIVERY_RADIUS}km`,
        distanceKm: parseFloat(distanceKm.toFixed(2)),
      };
    }

    const deliveryValue = BASE_FEE + distanceKm * FEE_PER_KM;

    const time = BASE_TIME_MINUTES + distanceKm * TIME_PER_KM;

    return {
      value: parseFloat(Math.max(BASE_FEE, deliveryValue).toFixed(2)),
      time: Math.round(time),
      pizzeria: PIZZERIA_ADDRESS,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
    };
  } catch (error) {
    console.error("Error calculating delivery:", error);
    return {
      value: BASE_FEE,
      time: BASE_TIME_MINUTES + 15,
      pizzeria: PIZZERIA_ADDRESS,
      error: "Error calculating, using default value",
    };
  }
}

function calculateDeliveryByNeighborhood(destinationNeighborhood: string): {
  value: number;
  time: number;
  pizzeria: typeof PIZZERIA_ADDRESS;
  distanceKm?: number;
} {
  const knownNeighborhoods: Record<
    string,
    { value: number; time: number; distance: number }
  > = {
    "VILA JOVINA": {
      value: BASE_FEE,
      time: BASE_TIME_MINUTES,
      distance: 0,
    },
    CENTRO: { value: 10, time: 35, distance: 2.5 },
    "JARDIM NOMURA": { value: 12, time: 40, distance: 3.8 },
    "CAUCAIA DO ALTO": { value: 15, time: 50, distance: 7.2 },
  };

  const neighborhoodUpper = destinationNeighborhood.toUpperCase();
  const delivery = knownNeighborhoods[neighborhoodUpper] || {
    value: BASE_FEE + 5,
    time: BASE_TIME_MINUTES + 20,
    distance: 5,
  };

  return {
    value: delivery.value,
    time: delivery.time,
    pizzeria: PIZZERIA_ADDRESS,
    distanceKm: delivery.distance,
  };
}
