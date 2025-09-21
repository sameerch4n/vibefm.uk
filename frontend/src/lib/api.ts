const API_BASE_URL = 'http://localhost:5178';

export class MusicAPI {
  private static async request(endpoint: string, params?: Record<string, string>) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  static async search(query: string, limit: number = 12) {
    return this.request('/api/search', { q: query, limit: limit.toString() });
  }

  static async getCharts() {
    return this.request('/api/charts');
  }

  static async getYouTubeVideo(query: string) {
    return this.request('/api/youtube', { q: query });
  }

  static async getITunesMetadata(id: string) {
    return this.request(`/api/itunes/${id}`);
  }
}
