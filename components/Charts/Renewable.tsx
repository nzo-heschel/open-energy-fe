import React from 'react';

const RenewableEnergyProgress = () => {
    // Key metrics from the provided data
    const targetPercentage = 25;
    const currentPercentage = 7.0;
    const productionValue = "3,200 TWH";

    // Calculate progress percentage
    const progressPercentage = (currentPercentage / targetPercentage) * 100;

    return (
        <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
                Renewable Energy Targets vs Actual Production
            </h2>

            {/* Progress visualization */}
            <div className="mb-6">
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Current Production</span>
                    <span className="text-sm font-medium text-gray-600">Target</span>
                </div>

                {/* Progress bar container */}
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                    {/* Progress fill */}
                    <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>

                {/* Percentage labels */}
                <div className="flex justify-between mt-2">
                    <span className="text-lg font-bold text-green-600">{currentPercentage}%</span>
                    <span className="text-lg font-bold text-blue-600">{targetPercentage}%</span>
                </div>
            </div>

            {/* Production value */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-center text-2xl font-bold text-blue-800">
                    {productionValue}
                </p>
                <p className="text-center text-sm text-gray-600 mt-1">
                    Current Renewable Energy Production
                </p>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6">
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-700">Actual Production</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-700">Target</span>
                </div>
            </div>

            {/* Additional context */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                    Progress toward renewable energy targets. The bar shows current production as a percentage of the ultimate goal.
                </p>
            </div>
        </div>
    );
};

export default RenewableEnergyProgress;