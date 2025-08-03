import { ref } from 'vue';
import * as echarts from 'echarts';
import ApiClient from '../api/index';

export const useCharts = () => {
  const loanChartRef = ref<HTMLDivElement>();
  const savingsChartRef = ref<HTMLDivElement>();
  let loanChart: echarts.ECharts | null = null;
  let savingsChart: echarts.ECharts | null = null;

  const initCharts = () => {
    if (loanChartRef.value) {
      loanChart = echarts.init(loanChartRef.value);
      updateLoanChart();
    }

    if (savingsChartRef.value) {
      savingsChart = echarts.init(savingsChartRef.value);
      updateSavingsChart();
    }

    window.addEventListener('resize', handleResize);
  };

  const handleResize = () => {
    loanChart?.resize();
    savingsChart?.resize();
  };

  const updateLoanChart = async () => {
    try {
      // Fetch all loans
      const data = await ApiClient.getJson('/loans');
      
      const loans = data.data || [];
      
      // Separate pending and completed loans
      const pendingLoans = loans.filter((loan: any) => loan.status === 'PENDING');
      const completedLoans = loans.filter((loan: any) => loan.status === 'COMPLETED');

      // Get the last 6 months
      const months = Array.from({length: 6}, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toLocaleString('default', { month: 'short' });
      }).reverse();

      const option = {
        title: {
          text: 'Loan Statistics',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Pending Loans', 'Completed Loans'],
          bottom: '5%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: months
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Pending Loans',
            type: 'bar',
            stack: 'total',
            data: months.map(month => 
              pendingLoans.filter((loan: any) => 
                new Date(loan.createdAt).toLocaleString('default', { month: 'short' }) === month
              ).reduce((sum: number, loan: any) => sum + loan.amount, 0)
            )
          },
          {
            name: 'Completed Loans',
            type: 'bar',
            stack: 'total',
            data: months.map(month => 
              completedLoans.filter((loan: any) => 
                new Date(loan.createdAt).toLocaleString('default', { month: 'short' }) === month
              ).reduce((sum: number, loan: any) => sum + loan.amount, 0)
            )
          }
        ]
      };

      loanChart?.setOption(option);
    } catch (error) {
      console.error('Failed to update loan chart:', error);
      // Set fallback data
      const fallbackOption = {
        title: {
          text: 'Loan Statistics (Demo Data)',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Pending Loans', 'Completed Loans'],
          bottom: '5%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Pending Loans',
            type: 'bar',
            stack: 'total',
            data: [12000, 15000, 18000, 14000, 16000, 13000]
          },
          {
            name: 'Completed Loans',
            type: 'bar',
            stack: 'total',
            data: [45000, 52000, 48000, 61000, 55000, 58000]
          }
        ]
      };
      loanChart?.setOption(fallbackOption);
    }
  };

  const updateSavingsChart = async () => {
    try {
      // Fetch all deposits
      const data = await ApiClient.getJson('/transactions', { type: 'DEPOSIT' });
      
      const deposits = data.data || [];

      // Group deposits by month
      const months = Array.from(new Set(
        deposits.map((tx: any) => new Date(tx.createdAt).toLocaleString('default', { month: 'short' }))
      )).sort();

      // Calculate total savings and new deposits for each month
      const totalSavings = months.map(month => {
        const monthDeposits = deposits.filter((tx: any) => 
          new Date(tx.createdAt).toLocaleString('default', { month: 'short' }) === month
        );
        return monthDeposits.reduce((sum: number, tx: any) => sum + tx.amount, 0);
      });

      const newDeposits = months.map(month => {
        const monthDeposits = deposits.filter((tx: any) => 
          new Date(tx.createdAt).toLocaleString('default', { month: 'short' }) === month
        );
        return monthDeposits.reduce((sum: number, tx: any) => sum + tx.amount, 0);
      });

      const option = {
        title: {
          text: 'Savings Trends',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['Total Savings', 'New Deposits'],
          bottom: '5%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: months
        },
        yAxis: {
          type: 'value',
          name: 'Amount'
        },
        series: [
          {
            name: 'Total Savings',
            type: 'line',
            data: totalSavings,
            smooth: true
          },
          {
            name: 'New Deposits',
            type: 'line',
            data: newDeposits,
            smooth: true
          }
        ]
      };

      savingsChart?.setOption(option);
    } catch (error) {
      console.error('Failed to update savings chart:', error);
      // Set fallback data
      const fallbackOption = {
        title: {
          text: 'Savings Trends (Demo Data)',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['Total Savings', 'New Deposits'],
          bottom: '5%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
        },
        yAxis: {
          type: 'value',
          name: 'Amount'
        },
        series: [
          {
            name: 'Total Savings',
            type: 'line',
            data: [85000, 92000, 98000, 105000, 112000, 125000],
            smooth: true
          },
          {
            name: 'New Deposits',
            type: 'line',
            data: [45000, 52000, 48000, 61000, 55000, 67000],
            smooth: true
          }
        ]
      };
      savingsChart?.setOption(fallbackOption);
    }
  };

  const fetchChartData = async () => {
    await Promise.all([updateLoanChart(), updateSavingsChart()]);
  };

  const disposeCharts = () => {
    window.removeEventListener('resize', handleResize);
    loanChart?.dispose();
    savingsChart?.dispose();
  };

  return {
    loanChartRef,
    savingsChartRef,
    initCharts,
    disposeCharts,
    fetchChartData
  };
};
