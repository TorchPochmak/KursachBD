// Получение торгового места по ID
export async function fetchTradeplaceById(marketid, id) {
    try {
      const response = await fetch(`/tradeplace/get/${marketid}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch tradeplace');
      }
  
      const tradeplaceData = await response.json();
      return tradeplaceData;
    } catch (error) {
      console.error('Error fetching tradeplace:', error.message);
      throw error;
    }
}
  
// Обновление данных торгового места
export async function updateTradeplace(marketid, id, tradeplace) {
    try {
        const response = await fetch(`/tradeplace/update/${marketid}/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeplace),
        });

        if (!response.ok) {
        throw new Error('Failed to update tradeplace');
        }

        const updatedTradeplace = await response.json();
        return updatedTradeplace;
    } catch (error) {
        console.error('Error updating tradeplace:', error.message);
        throw error;
    }
}
  
// Удаление торгового места
export async function deleteTradeplace(marketid, id) {
    try {
      const response = await fetch(`/tradeplace/delete/${marketid}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete tradeplace');
      }
  
      return { message: 'Tradeplace deleted successfully' };
    } catch (error) {
      console.error('Error deleting tradeplace:', error.message);
      throw error;
    }
}