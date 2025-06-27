import { ref } from 'vue';
import * as echarts from 'echarts';

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
      // Fetch active loans
      const activeResponse = await fetch('/api/loans?status=ACTIVE');
      const activeData = await activeResponse.json();
      const activeLoans = activeData.data;

      // Fetch overdue loans
      const overdueResponse = await fetch('/api/loans?status=ACTIVE&repaymentDate[lt]=now()');
      const overdueData = await overdueResponse.json();
      const overdueLoans = overdueData.data;

      // Fetch completed loans
      const completedResponse = await fetch('/api/loans?status=COMPLETED');
      const completedData = await completedResponse.json();
      const completedLoans = completedData.data;

      // Group loans by month
      const months = Array.from(new Set([
        ...activeLoans.map((loan: any) => new Date(loan.createdAt).toLocaleString('default', { month: 'short' })),
        ...overdueLoans.map((loan: any) => new Date(loan.createdAt).toLocaleString('default', { month: 'short' })),
        ...completedLoans.map((loan: any) => new Date(loan.createdAt).toLocaleString('default', { month: 'short' }))
      ])).sort();

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Active Loans', 'Overdue Loans', 'Completed Loans']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: months
        },
        yAxis: {
          type: 'value',
          name: 'Amount'
        },
        series: [
          {
            name: 'Active Loans',
            type: 'bar',
            stack: 'total',
            data: months.map(month => 
              activeLoans.filter((loan: any) => 
                new Date(loan.createdAt).toLocaleString('default', { month: 'short' }) === month
              ).reduce((sum: number, loan: any) => sum + loan.amount, 0)
            )
          },
          {
            name: 'Overdue Loans',
            type: 'bar',
            stack: 'total',
            data: months.map(month => 
              overdueLoans.filter((loan: any) => 
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
    }
  };

  const updateSavingsChart = async () => {
    try {
      // Fetch all deposits
      const response = await fetch('/api/transactions?type=DEPOSIT');
      const data = await response.json();
      const deposits = data.data;

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
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['Total Savings', 'New Deposits']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
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
