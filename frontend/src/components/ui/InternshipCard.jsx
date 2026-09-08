import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import TagChip from './TagChip';
import Button from './Button';
import PaymentButton from '../PaymentButton';
import { trackInternshipClick } from '../../utils/trackClick';

/**
 * Internship/Course Card component
 * - 4:3 thumbnail ratio, 120-140px height
 * - Title, meta, tag chips, price, two actions
 * - Uniform height per grid
 * - Hover: subtle lift + stronger shadow
 */
const InternshipCard = ({ 
  internship, 
  isPurchased = false,
  onViewDetails,
  onRegister,
  className = '' 
}) => {
  const navigate = useNavigate();
  const thumbnailUrl = internship.thumbnail?.url || internship.thumbnailUrl || '/placeholder-internship.jpg';
  const category = internship.category?.name || internship.category || 'General';
  const duration = internship.duration || '6 months';
  const guidance = internship.guidance || internship.tutor || 'Expert';
  const price = internship.price || 0;
  const discountedPrice = internship.discountedPrice || null;
  const displayPrice = discountedPrice && discountedPrice > 0 ? discountedPrice : price;
  const rating = internship.rating || 0;

  const detailUrl = onViewDetails || `/internship/${internship._id}`;

  const handleCardClick = (e) => {
    // Don't navigate if clicking on buttons or links
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('[data-no-navigate]')) {
      return;
    }
    // Track internship click
    trackInternshipClick({
      internshipId: internship._id,
      internshipTitle: internship.title,
      internshipPrice: displayPrice,
      page: window.location.pathname,
    });
    navigate(detailUrl);
  };

  const handleViewDetailsClick = () => {
    // Track internship click when "View Details" is clicked
    trackInternshipClick({
      internshipId: internship._id,
      internshipTitle: internship.title,
      internshipPrice: displayPrice,
      page: window.location.pathname,
    });
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-white rounded-card shadow-card overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-lg flex flex-col h-full cursor-pointer ${className}`}
    >
      {/* Thumbnail - 4:3 ratio, 120-140px height */}
      <div className="relative w-full h-[140px] overflow-hidden bg-gray-100">
        <img 
          src={thumbnailUrl} 
          alt={internship.title || 'Internship thumbnail'} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {isPurchased && (
          <div className="absolute top-2 left-2">
            <TagChip variant="accent" size="small">
              Enrolled
            </TagChip>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category Tag */}
        <div className="mb-2">
          <TagChip variant="default" size="small">
            {category}
          </TagChip>
        </div>
        
        {/* Title */}
        <h3 className="text-h3 font-headline font-semibold text-text mb-2 line-clamp-2 min-h-[3rem]">
          {internship.title}
        </h3>
        
        {/* Meta Info */}
        <div className="space-y-1.5 mb-4 text-small text-muted">
          <div className="flex items-center">
            <UserGroupIcon className="h-4 w-4 mr-1.5" />
            <span>Guidance by {guidance}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1.5" />
            <span>{duration}</span>
          </div>
          {rating > 0 && (
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 mr-1.5 text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {/* Price and Actions - Fixed at bottom */}
        <div className="mt-auto pt-3 border-t border-border">
          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              {discountedPrice && discountedPrice > 0 ? (
                <>
                  <p className="text-xl font-bold text-brand-blue">
                    ₹{discountedPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-500 line-through">
                    ₹{price.toLocaleString('en-IN')}
                  </p>
                </>
              ) : (
                <p className="text-xl font-bold text-brand-blue">
                  ₹{price.toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </div>
          
          {/* Coupon area (left aligned) */}
          <div className="w-full mt-2 text-left" onClick={(e) => e.stopPropagation()}>
            {!isPurchased && (
              <PaymentButton
                itemId={internship._id}
                itemType="internship"
                price={displayPrice}
                title={internship.title}
                showCouponLink={true}
                hideButton={true}
                className=""
              />
            )}
          </div>

          <div className="w-full mt-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-row items-center gap-2 sm:gap-3 justify-center w-full">
              <Link to={detailUrl} onClick={handleViewDetailsClick} className="flex-1">
                <Button variant="secondary" size="small" className="w-full h-10 inline-flex items-center justify-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold">
                View Details
              </Button>
            </Link>
            
            {isPurchased ? (
                <Link to="/user/internship" onClick={(e) => e.stopPropagation()} className="flex-1">
                  <button className="w-full h-10 inline-flex items-center justify-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-button bg-[#0052A3] text-white hover:bg-[#004085] transition-colors whitespace-nowrap">
                  Go to Dashboard
                </button>
              </Link>
            ) : (
                <div data-no-navigate onClick={(e) => e.stopPropagation()} className="flex-1">
                <PaymentButton
                  itemId={internship._id}
                  itemType="internship"
                  price={displayPrice}
                  title={internship.title}
                    hideCoupon={true}
                    hidePriceDisplay={true}
                    className="w-full h-10 inline-flex items-center justify-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-button bg-[#0052A3] text-white hover:bg-[#004085] transition-colors whitespace-nowrap"
                >
                  Register Now
                </PaymentButton>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipCard;

