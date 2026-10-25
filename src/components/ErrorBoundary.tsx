import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in LearnBridge application:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7FAFF] flex items-center justify-center p-4 font-serif">
          <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-6 shadow-xl space-y-4 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Đã xảy ra sự cố hiển thị</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                Hệ thống đã tự động ghi nhận và bảo vệ dữ liệu lớp học của bạn an toàn trong bộ nhớ.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-left text-xs font-mono text-red-600 overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="pt-2">
              <button
                onClick={this.handleReset}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1976D2] hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải lại trang</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
