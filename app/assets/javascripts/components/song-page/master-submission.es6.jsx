class MasterSubmission extends React.Component {
  constructor() {
    super();
    this.state = {
      showSubmissionForm: false,
      masterFile: null,
      currentlyUploading: false,
      uploadComplete: false,
      errorsPresent: false,
      errors: []
    }
    this.toggleFormView = this.toggleFormView.bind(this);
    this.submitMaster = this.submitMaster.bind(this);
    this.changeFile = this.changeFile.bind(this);
  }

  toggleFormView() {
    this.setState({
      showSubmissionForm: !this.state.showSubmissionForm,
      errorsPresent: false
    })
  }

  changeFile(e) {
    var reader = new FileReader();
    var file = e.target.files[0];
    var that = this;

    reader.onloadend = function() {
      that.setState({ masterFile: file })
    }

    if (file) {
      reader.readAsDataURL(file);
    } else {
      this.setState({ masterFile: null })
    }
  }

  findIncludedFeatures() {
    var checkedCheckboxIDs = []
    var allCheckboxes = document.getElementsByName('includedFeature');
    for (var i = 0; i < allCheckboxes.length; i++) {
      if (allCheckboxes[i].checked === true) {
        checkedCheckboxIDs.push(allCheckboxes[i].value)
      }
    }
    return checkedCheckboxIDs
  }

  submitMaster(e) {
    e.preventDefault();

    this.setState({
      currentlyUploading: true
    })

    let description = this.refs.trackDescription;
    let songID = this.refs.trackSong.value;
    let file = this.state.masterFile;
    let includedFeatures = this.findIncludedFeatures();
    let songFinished = this.refs.finished.value;

    var formData = new FormData();
    formData.append("master_track[song_id]", songID);
    formData.append("master_track[description]", description.value);
    formData.append("master_track[file]", file);
    formData.append("includedFeatures", includedFeatures);
    formData.append("songFinished", songFinished);

    fetch('/master_tracks', {
      method: "post",
      dataType: "JSON",
      headers: {
        "X-CSRF-Token": this.props.csrf
        },
      credentials: "include",
      body: formData
    })
    .then((response) => response.json())
    .then((json) => {
      if (json.errors) {
        this.setState({
          currentlyUploading: false,
          errorsPresent: true,
          errors: json.errors
        })
      } else {
        this.setState({
          errorsPresent: false,
          currentlyUploading: false,
          uploadComplete: true,
          showSubmissionForm: false
        })
        this.props.updateAfterMaster(json);
        description.value = "";
      }
    })
  }

  render() {
    return(
      <div className="submission-form-holder">
        <a href="#" onClick={this.toggleFormView}>
          { this.state.showSubmissionForm ?
              <p id="new-master-submission-button">Hide Submission Form</p>
            :
              <p id="new-master-submission-button">Submit New Master Track</p>
          }
        </a>
        { this.state.currentlyUploading ?
            <p>Uploading File...</p>
          :
            null
        }
        { this.state.uploadComplete ?
            <p>Upload Complete!</p>
          :
            null
        }
        { this.state.showSubmissionForm ?
            <div className="form-holder">
              <h4>Upload a New Master Track</h4>
              { this.state.errorsPresent ?
                  < ErrorDisplay errors={this.state.errors} />
                :
                  null
              }
              <form encType="multipart/form-data" onSubmit={this.submitMaster}>
                <input type="hidden" name="master_track[song_id]" ref="trackSong" value={this.props.song.id} />
                <label htmlFor="master_track[description]" className="form-label">Track Description:</label>
                <br/>
                <textarea rows="4" cols="60" name="feature_track[description]" ref="trackDescription"></textarea>
                <br/>
                <label className="form-label">What feature tracks are included in this master? <span className="small-text">Please check all that apply</span></label>
                <br/>
                { this.props.song.feature_tracks.map((feature, i) => {
                  return <span className="form-input" key={i}>
                           <input type="checkbox" name="includedFeature" value={feature.id} />
                           {feature.talent.title} by {feature.user.username} <span className="small-text">
                            ({feature.file_name})
                           </span>
                           <br/>
                         </span>
                  })
                }
                <input type="file" name="master_track[file]" className="form-input" ref="trackFile" onChange={this.changeFile} />
                <label htmlFor="songFinished]" className="form-label">Is this song now finished?</label>
                <select ref="finished" name="songFinished">
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
                <br/>
                <input type="submit" value="Upload Track" className="form-input" />
              </form>
              <br/>
              <br/>
            </div>
          :
            null
        }
      </div>
    )
  }
}