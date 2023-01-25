import axios from 'axios';
import { aktPriceApi } from '../../_helpers/constants';

/**
 * Get Price and Market Cap
 * */
export default async function fetchPriceAndMarketCap() {
  try {
    const response = await axios.get(aktPriceApi);
    return {
      current_price: parseFloat(response.data.market_data.current_price.usd),
    };
  } catch (error) {
    console.error('Can not retrieve price information about AKT', error);
  }
}
