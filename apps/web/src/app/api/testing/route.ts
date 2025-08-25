import { NextRequest, NextResponse } from 'next/server';
import { runAllApiTests, exportTestResults } from '@/lib/testing/api-test-suite';
import { performanceMonitor } from '@/lib/monitoring/performance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'run';
    const baseUrl = searchParams.get('baseUrl') || 'http://localhost:3000';
    const exportResults = searchParams.get('export') === 'true';

    console.log('🧪 API Testing endpoint called:', { action, baseUrl, exportResults });

    switch (action) {
      case 'run':
        return await runTests(baseUrl, exportResults);
      
      case 'status':
        return await getTestStatus();
      
      case 'history':
        return await getTestHistory();
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: run, status, history'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error in API testing endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Testing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function runTests(baseUrl: string, exportResults: boolean) {
  const startTime = Date.now();
  
  console.log('🚀 Starting API tests...');
  
  try {
    const testResults = await runAllApiTests(baseUrl);
    const duration = Date.now() - startTime;

    // Сохраняем результаты в базу данных
    await saveTestResults(testResults);

    const response = {
      success: true,
      message: 'API tests completed successfully',
      data: {
        ...testResults,
        duration,
        timestamp: new Date().toISOString(),
      }
    };

    if (exportResults) {
      const exportData = exportTestResults(testResults.results, testResults.summary);
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="api-test-results.json"',
        },
      });
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Test execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function getTestStatus() {
  try {
    // Получаем последние результаты тестов из базы данных
    const recentTests = await getRecentTestResults();
    
    return NextResponse.json({
      success: true,
      data: {
        lastRun: null, // TODO: Implement when DB integration is ready
        totalRuns: recentTests.length,
        recentResults: recentTests.slice(0, 5),
        averageSuccessRate: calculateAverageSuccessRate(recentTests),
      }
    });

  } catch (error) {
    console.error('❌ Error getting test status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get test status'
    }, { status: 500 });
  }
}

async function getTestHistory() {
  try {
    const limit = 10; // Default limit
    
    const history = await getTestHistoryFromDB(limit);
    
    return NextResponse.json({
      success: true,
      data: {
        history,
        count: history.length,
      }
    });

  } catch (error) {
    console.error('❌ Error getting test history:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get test history'
    }, { status: 500 });
  }
}

// Функции для работы с базой данных
async function saveTestResults(testResults: any) {
  try {
    // Здесь будет интеграция с Supabase для сохранения результатов тестов
    // Пока используем in-memory хранение
    console.log('💾 Saving test results to database...');
    
    // TODO: Реализовать сохранение в Supabase
    // const { data, error } = await supabase
    //   .from('test_results')
    //   .insert({
    //     timestamp: new Date().toISOString(),
    //     summary: testResults.summary,
    //     results: testResults.results,
    //     suites: testResults.suites,
    //   });
    
    console.log('✅ Test results saved successfully');
    
  } catch (error) {
    console.error('❌ Error saving test results:', error);
    throw error;
  }
}

async function getRecentTestResults() {
  try {
    // TODO: Реализовать получение из Supabase
    // const { data, error } = await supabase
    //   .from('test_results')
    //   .select('*')
    //   .order('timestamp', { ascending: false })
    //   .limit(10);
    
    return [];
    
  } catch (error) {
    console.error('❌ Error getting recent test results:', error);
    return [];
  }
}

async function getTestHistoryFromDB(limit: number) {
  try {
    // TODO: Реализовать получение из Supabase
    // const { data, error } = await supabase
    //   .from('test_results')
    //   .select('*')
    //   .order('timestamp', { ascending: false })
    //   .limit(limit);
    
    return [];
    
  } catch (error) {
    console.error('❌ Error getting test history:', error);
    return [];
  }
}

function calculateAverageSuccessRate(tests: any[]): number {
  if (tests.length === 0) return 0;
  
  const totalRate = tests.reduce((sum, test) => {
    return sum + (test.summary?.successRate || 0);
  }, 0);
  
  return totalRate / tests.length;
}
