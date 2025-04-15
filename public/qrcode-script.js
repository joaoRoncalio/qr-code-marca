document.addEventListener("DOMContentLoaded", () => {
  // Configuração inicial do QR Code
  const qrCode = new QRCodeStyling({
    width: 256,
    height: 256,
    data: "https://seulink.com", // Link padrão
    dotsOptions: {
      color: "#111111", // Cor inicial do QR
      type: "rounded",
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 10,
    },
  });

  // Adiciona o QR Code gerado no div
  qrCode.append(document.getElementById("qrcode"));

  // Atualiza o QR Code ao modificar o link
  document.getElementById("link").addEventListener("input", (e) => {
    qrCode.update({ data: e.target.value });
  });

  // Atualiza a cor do QR Code
  document.getElementById("color").addEventListener("input", (e) => {
    qrCode.update({
      dotsOptions: { color: e.target.value },
    });
  });

  // Atualiza a logo no centro do QR Code
  document.getElementById("logo").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        qrCode.update({ image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  });

  // Função para download em PNG
  document.getElementById("download-png").addEventListener("click", () => {
    qrCode.download({ name: "qr-code", extension: "png" });
  });

  // Função para download em SVG
  document.getElementById("download-svg").addEventListener("click", () => {
    qrCode.download({ name: "qr-code", extension: "svg" });
  });
});
