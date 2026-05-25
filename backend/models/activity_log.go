package models

import "time"

type ActivityLog struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	Action    string    `json:"action" gorm:"size:100;not null"`
	Detail    string    `json:"detail" gorm:"type:text"`
	IPAddress string    `json:"ip_address" gorm:"size:45"`
	CreatedAt time.Time `json:"created_at"`
}
