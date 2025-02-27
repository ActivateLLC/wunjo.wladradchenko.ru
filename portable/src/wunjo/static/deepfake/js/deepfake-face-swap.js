// FACE SWAP //
function handleCheckboxFaceSwapClick(clickedId) {
    const checkboxes = ['multiface-deepfake', 'similarface-deepfake'];
    checkboxes.forEach(id => {
        if (id !== clickedId) {
            document.getElementById(id).checked = false;
        }
    });
}


function initiateFaceSwapPop(button, audio_url = undefined, audio_name = undefined) {
  var introFaceSwap = introJs();
  introFaceSwap.setOptions({
    steps: [
      {
        title: "Face swap panel",
        position: "right",
        intro: `<div style="width: 80vw; max-width: 90vw; height: 83vh; max-height: 90vh;align-items: inherit;display: flex;flex-direction: column;justify-content: space-between">
                    <div>
                        <fieldset style="padding: 5pt;margin: 13pt;margin-top: 0;flex-direction: row;display: flex;">
                        <legend>Settings</legend>
                            <div style="padding: 5pt;">
                              <input type="checkbox" id="multiface-deepfake" name="multiface" onclick="handleCheckboxFaceSwapClick('multiface-deepfake')">
                              <label for="multiface-deepfake">Replace all faces</label>
                            </div>
                            <div style="padding: 5pt;">
                              <input type="checkbox" id="similarface-deepfake" name="similarface" onclick="handleCheckboxFaceSwapClick('similarface-deepfake')">
                              <label for="similarface-deepfake">Several identical faces</label>
                            </div>
                        </fieldset>
                        <div>
                            <div style="padding: 5pt;margin-left: 7pt;">
                              <label for="similar-coeff-face">Coefficient facial similarity</label>
                              <input type="number" title="Введите число" id="similar-coeff-face" name="similar-coeff" min="0.1" max="3" step="0.1" value="1.2" style="border-color: rgb(192, 192, 192);background-color: #fff;padding: 1pt;width: 60pt;">
                            </div>
                        </div>
                    </div>
                    <div lang="ru" style="display: flex; flex-direction: column;">
                        <div style="display: flex;justify-content: space-evenly;">
                            <div style="width: 35vw;">
                                <span class="dragBox" style="margin-bottom: 15px;width: 100%;display: flex;text-align: center;flex-direction: column;position: relative;justify-content: center;height: 45vh;">
                                      Load target image or video
                                    <input accept="image/*,video/*" type="file" onChange="handleFaceSwap(event, document.getElementById('preview-media-target'), this.parentElement, document.getElementById('message-about-status-target'))" ondragover="drag(this.parentElement)" ondrop="drop(this.parentElement)" />
                                </span>
                                <p id="message-about-status-target" style="text-align: center;color: #393939;height: 30px;display: none;justify-content: center;align-items: center;padding: 5px;margin-bottom: 15px;"></p>
                                <div id="preview-media-target" style="position: relative;max-width: 60vw; max-height:60vh;display: flex;flex-direction: column;align-items: center;">
                                </div>
                            </div>
                            <div style="width: 35vw;">
                                <span class="dragBox" style="margin-bottom: 15px;width: 100%;display: flex;text-align: center;flex-direction: column;position: relative;justify-content: center;height: 45vh;">
                                      Load source image or video
                                    <input accept="image/*,video/*" type="file" onChange="handleFaceSwap(event, document.getElementById('preview-media-source'), this.parentElement, document.getElementById('message-about-status-source'))" ondragover="drag(this.parentElement)" ondrop="drop(this.parentElement)" />
                                </span>
                                <p id="message-about-status-source" style="text-align: center;color: #393939;height: 30px;display: none;justify-content: center;align-items: center;padding: 5px;margin-bottom: 15px;"></p>
                                <div id="preview-media-source" style="position: relative;max-width: 60vw; max-height:60vh;display: flex;flex-direction: column;align-items: center;">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <i id="inspect-models-face-swap" style="font-size: 10pt;margin-top: 5px;"></i>
                        <button class="introjs-button" style="background: #f7db4d;margin-top: 10pt;text-align: center;width: 100%;padding-right: 0 !important;padding-left: 0 !important;padding-bottom: 0.5rem !important;padding-top: 0.5rem !important;" onclick="triggerFaceSwapSynthesis(this.parentElement.parentElement.parentElement);">Start processing</button>
                    </div>
                    </div>`,
      },
    ],
    showButtons: false,
    showStepNumbers: false,
    showBullets: false,
    nextLabel: "Next",
    prevLabel: "Back",
    doneLabel: "Close",
  });
  introFaceSwap.setOption('keyboardNavigation', false).start();

  // Msg about inspect models
  const inspectElem = document.getElementById("inspect-models-face-swap")
  inspectElem.innerHTML = "";
  getInspectMessage(inspectElem, "/inspect_face_animation");
}

// HANDLE FACE SWAP //
async function handleFaceSwap(event, previewElement, parentElement, messageElement){
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
        const fileUrl = window.URL.createObjectURL(file);
        const fileType = file.type.split('/')[0];
        parentElement.style.height = "30px";
        previewElement.innerHTML = "";
        let messageAboutStatusText;

        let canvas;
        if (fileType === 'image') {
            messageElement.style.display = "flex";
            messageElement.style.background = getRandomColor();
            messageAboutStatusText = await translateWithGoogle("Choose a face to animate by tool","auto",targetLang);
            messageElement.innerHTML = `${messageAboutStatusText} <i class="fa-solid fa-draw-polygon" style="margin-left: 10px;"></i>`;
            canvas = await setupImageCanvas(previewElement, fileUrl, "40vh", "35vw");
        } else if (fileType === 'video') {
            messageElement.style.display = "flex";
            messageElement.style.background = getRandomColor();
            messageAboutStatusText = await translateWithGoogle("Video is loading...","auto",targetLang);
            messageElement.innerHTML = `${messageAboutStatusText}`;
            canvas = await setupVideoTimeline(previewElement, fileUrl, "40vh", "35vw");
            messageElement.style.background = getRandomColor();
            messageAboutStatusText = await translateWithGoogle("Choose a face to animate by tool","auto",targetLang);
            messageElement.innerHTML = `${messageAboutStatusText} <i class="fa-solid fa-draw-polygon" style="margin-left: 10px;"></i>`;
        }
        canvas.addEventListener('click', setPointOnCanvas);
    }
}
// HANDLE FACE SWAP //

function triggerFaceSwapSynthesis(elem) {
    fetch("/synthesize_process/")
        .then(response => response.json())
        .then(data => processFaceSwap(data, elem))
        .catch(error => {
            console.error("Error fetching the synthesis process status:", error);
        });
}

async function processFaceSwap(data, element) {
    async function displayStatus(elem, message) {
        const translatedMessage = await translateWithGoogle(message, "auto", targetLang);
        elem.innerText = translatedMessage;
        elem.style.display = "flex";
        elem.style.background = getRandomColor();
    }

    const messageSource = element.querySelector("#message-about-status-source");
    const messageTarget = element.querySelector("#message-about-status-target");
    [messageSource, messageTarget].forEach(msg => {
        msg.innerHTML = "";
        msg.style.display = "none";
    });

    if (data.status_code !== 200) {
        displayStatus(messageTarget, "The process is busy");
        displayStatus(messageSource, "Wait for the previous process to finish");
        return;
    }

    const targetDetails = retrieveMediaDetails(element.querySelector("#preview-media-target"));
    const sourceDetails = retrieveMediaDetails(element.querySelector("#preview-media-source"));

    if (!targetDetails.mediaName || !sourceDetails.mediaName) {
        if (!targetDetails.mediaName) displayStatus(messageTarget, "You haven't loaded the target media. Click on the select upload window.");
        if (!sourceDetails.mediaName) displayStatus(messageSource, "You haven't loaded the source media. Click on the select source window.");
        return;
    }

    const targetPreviewElement = element.querySelector("#preview-media-target")
    const multiFaceChecked = element.querySelector("#multiface-deepfake").checked

    if (multiFaceChecked) {
        // Create a new click event
        const canvasTargetElement = targetPreviewElement.querySelector(".canvasMedia");
        const clickEvent = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: 0,
            clientY: 0,
            offsetX: 0,
            offsetY: 0
        });

        // Dispatch the event on the canvas
        canvasTargetElement.dispatchEvent(clickEvent);
    }

    const targetFaceData = retrieveSelectedFaceData(targetPreviewElement);
    const sourceFaceData = retrieveSelectedFaceData(element.querySelector("#preview-media-source"));

    if (!targetFaceData || !sourceFaceData) {
        if (!targetFaceData) displayStatus(messageTarget, "Ensure face selection is set on target media");
        if (!sourceFaceData) displayStatus(messageSource, "Ensure face selection is set on source media");
        return;
    }

    const faceSwapParameters = {
        face_target_fields: targetFaceData,
        target_content: targetDetails.mediaName,
        video_start_target: targetDetails.mediaStart,
        video_end_target: targetDetails.mediaEnd,
        type_file_target: targetDetails.mediaType,
        face_source_fields: sourceFaceData,
        source_content: sourceDetails.mediaName,
        video_current_time_source: sourceDetails.mediaCurrentTime,
        video_end_source: sourceDetails.mediaEnd,
        type_file_source: sourceDetails.mediaType,
        multiface: multiFaceChecked,
        similarface: element.querySelector("#similarface-deepfake").checked,
        similar_coeff: element.querySelector("#similar-coeff-face").value
    };

    fetch("/synthesize_face_swap/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faceSwapParameters)
    });

    // This open display result for deepfake videos
    closeTutorial();
}
