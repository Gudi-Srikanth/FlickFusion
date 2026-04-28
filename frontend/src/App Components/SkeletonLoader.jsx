import React from "react";
import { Skeleton } from "@mui/material";
import "./SkeletonLoader.css";

/**
 * Reusable skeleton loading component for various content types
 */

export const SkeletonLoader = ({ variant = "card", count = 1 }) => {
  const renderCardSkeleton = () => (
    <div className="skeleton-card">
      <Skeleton
        variant="rectangular"
        width="100%"
        height={250}
        className="skeleton-poster"
      />
      <div className="skeleton-info">
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="40%" height={16} />
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="skeleton-list-item">
      <Skeleton
        variant="rectangular"
        width={60}
        height={90}
        className="skeleton-thumbnail"
      />
      <div className="skeleton-content">
        <Skeleton variant="text" width="70%" height={20} />
        <Skeleton variant="text" width="50%" height={16} />
        <Skeleton variant="text" width="30%" height={14} />
      </div>
    </div>
  );

  const renderDetailsSkeleton = () => (
    <div className="skeleton-details">
      <Skeleton
        variant="rectangular"
        width="100%"
        height={400}
        className="skeleton-backdrop"
      />
      <div className="skeleton-details-content">
        <Skeleton variant="text" width="60%" height={40} />
        <div className="skeleton-meta">
          <Skeleton variant="text" width={80} height={20} />
          <Skeleton variant="text" width={100} height={20} />
        </div>
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
        <div className="skeleton-genres">
          <Skeleton variant="rectangular" width={60} height={24} />
          <Skeleton variant="rectangular" width={80} height={24} />
          <Skeleton variant="rectangular" width={70} height={24} />
        </div>
      </div>
    </div>
  );

  const renderProfileSkeleton = () => (
    <div className="skeleton-profile">
      <Skeleton
        variant="circular"
        width={120}
        height={120}
        className="skeleton-avatar"
      />
      <Skeleton variant="text" width={150} height={24} />
      <Skeleton variant="text" width={100} height={18} />
    </div>
  );

  const renderReviewSkeleton = () => (
    <div className="skeleton-review">
      <div className="skeleton-review-header">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width={120} height={18} />
      </div>
      <Skeleton variant="text" width="100%" height={16} />
      <Skeleton variant="text" width="90%" height={16} />
      <Skeleton variant="text" width="60%" height={16} />
    </div>
  );

  const renderGridSkeleton = () => (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-grid-item">
          <Skeleton
            variant="rectangular"
            width="100%"
            height={180}
          />
          <Skeleton variant="text" width="80%" height={18} />
          <Skeleton variant="text" width="50%" height={14} />
        </div>
      ))}
    </div>
  );

  const getSkeleton = () => {
    switch (variant) {
      case "card":
        return renderCardSkeleton();
      case "list":
        return renderListSkeleton();
      case "details":
        return renderDetailsSkeleton();
      case "profile":
        return renderProfileSkeleton();
      case "review":
        return renderReviewSkeleton();
      case "grid":
        return renderGridSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  if (variant === "grid" || variant === "card") {
    return (
      <div className={`skeleton-container skeleton-${variant}-container`}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-wrapper">
            {getSkeleton()}
          </div>
        ))}
      </div>
    );
  }

  return <div className="skeleton-container">{getSkeleton()}</div>;
};

export default SkeletonLoader;