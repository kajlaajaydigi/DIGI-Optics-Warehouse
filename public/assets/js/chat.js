axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').content;

document.getElementById('chatForm').addEventListener('submit', async function(e){
    e.preventDefault();
    const msg = document.getElementById('message').value.trim();
    if (!msg) return;
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML += '<div class="text-black user-message" style="font-size:14px;margin-bottom:10px;padding: 10px 30px;background-color: #eee;border-radius: 20px;"><strong>You:</strong> '+msg+'</div>';
    document.getElementById('message').value = '';
    document.getElementById('status').innerText = 'Thinking...';

    try {
        const res = await axios.post("/ask-digi", { message: msg });
        let html = res.data.answer;
        // Decode HTML entities if needed
        const decodeHtml = (str) => {
            var txt = document.createElement('textarea');
            txt.innerHTML = str;
            return txt.value;
        };
        if (typeof html === 'string') {
            html = decodeHtml(html);
        } else {
            html = JSON.stringify(html);
        }
        chatBox.innerHTML += `
            <div class="text-primary digi-ai-reply" style="font-size:14px;margin-bottom:10px;padding: 10px 30px;background-color: #ffffff;color: #000000 !important;border-radius: 20px;">
                <span style="font-weight: bold;margin-bottom: 10px;">DIGI AI:</span><br><br> ${html}
            </div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
        chatBox.innerHTML += `
            <div class="text-primary" style="font-size:14px;margin-bottom:10px;padding: 10px 30px;background-color: var(--bs-danger);color: #ffffff !important;border-radius: 20px;">
                <strong>Error:</strong> ${(err.response?.data?.message ?? err.message)}
            </div>`;
    }
    finally {
        document.getElementById('status').innerText = '';
    }

});
