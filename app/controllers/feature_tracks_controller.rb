class FeatureTracksController < ApplicationController
  def create
    errors = []

    if params[:feature_track][:file] != "null"  
      s3 = AWS::S3.new(:access_key_id => ENV['ACCESS_KEY_ID'], :secret_access_key => ENV['SECRET_ACCESS_KEY'])

      obj = s3.buckets[ENV['S3_BUCKET']].objects[params[:feature_track][:file].original_filename]

      obj.write(
        file: params[:feature_track][:file],
        acl: :public_read
      )

      song = Song.find_by(id: params[:feature_track][:song_id])

      feature_track = song.feature_tracks.new(feature_track_params)

      feature_track.file_name = obj.key
      feature_track.file_path = obj.public_url

      feature_track.save

      new_feature_list = song.feature_tracks
    else
      errors << "Each feature track submission must have an attached audio file"
    end

    if errors.length > 0
      render json: { errors: errors }, status: 400
    else
      render json: new_feature_list.as_json(include: [:user, :talent])
    end
  end

  def destroy
    feature_track = FeatureTrack.find(params[:id])
    feature_track.destroy
    song = feature_track.song
    new_feature_list = song.feature_tracks
    render json: new_feature_list.as_json(include: [:user, :talent])
  end

  private
  def feature_track_params
    params.require(:feature_track).permit(:talent_id, :user_id, :description, :song_id)
  end
end
