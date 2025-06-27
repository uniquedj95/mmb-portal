import { ref } from 'vue';

// Sample data - replace with actual API calls in a real implementation
const recentActivities = ref([
  { content: 'Restocked Paracetamol', timestamp: '2023-10-15 09:30' },
  { content: 'Dispensed Antibiotics', timestamp: '2023-10-15 10:45' },
  { content: 'New shipment received', timestamp: '2023-10-14 14:20' },
  { content: 'Inventory count performed', timestamp: '2023-10-13 16:00' },
  { content: 'Expired items removed', timestamp: '2023-10-12 08:15' }
]);

// In a real application, you would add functions to add new activities
// and possibly fetch them from an API
function addActivity(content: string) {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  recentActivities.value.unshift({
    content,
    timestamp
  });
}

export function useRecentActivities() {
  return {
    recentActivities,
    addActivity
  };
}
