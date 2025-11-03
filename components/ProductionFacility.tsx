import React from 'react'
import InstalledCapacityTwo from './Charts/InstalledCapacityTwo'
import InstalledCapacityOne from './Charts/InstalledCapacityOne'

const ProductionFacility = () => {
    return (
        <div>
            <div className="md:px-[60px] px-5 pb-[52px]">
                <h2 className='text-[#276E4E] text-[34px] font-extrabold'>מתקני ייצור מחוברים</h2>
            </div>
            <div className="flex flex-col gap-10 bg-[#FDFBF6] border border-[#DEDEDE]/70 md:rounded-[40px] rounded-[20px] md:px-[60px] px-5 md:py-[50px] py-5">
                <InstalledCapacityOne />
                <InstalledCapacityTwo />
            </div>
        </div>
    )
}

export default ProductionFacility