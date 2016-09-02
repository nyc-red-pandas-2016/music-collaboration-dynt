Rails.application.routes.draw do
  devise_for :users, controllers: { sessions: 'users/sessions' }
  root to: 'songs#index'
  resources :users
  resources :songs
end
