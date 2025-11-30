var swiper = new Swiper(".mySwiper", {
  slidesPerView: 3,
  spaceBetween: 30,
  loop: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  controller: {
    inverse: true,
  },
  navigation: {
    nextEl: ".button-right",
    prevEl: ".button-left",
  },
});

const modal = document.getElementById("containerM");
      const fechar = document.querySelector(".fechar");
      const form = document.getElementById("form-editar");

      // Função pra abrir o modal com os dados do produto
      async function abrirModalEdicao(id) {
        try {
          const res = await fetch(`/api/user/${id}`);
          if (!res.ok) throw new Error("Erro ao buscar produto!");

          const produto = await res.json();

          document.getElementById("edit-id").value = users.id;
          document.getElementById("edit-nome").value = users.nome;
          document.getElementById("edit-preco").value = users.preco;
          document.getElementById("edit-categoria").value = users.categoria;
          document.getElementById("edit-estoque").value = users.estoque;

          modal.style.display = "flex";
        } catch (err) {
          alert(err.message);
        }
      }

      // Fecha o modal
      fechar.onclick = () => (modal.style.display = "none");
      window.onclick = (e) => {
        if (e.target === modal) modal.style.display = "none";
      };

      // Quando clicar em "Editar"
      document.querySelectorAll(".editar").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const id = btn.dataset.id;
          abrirModalEdicao(id);
        });
      });

      // Enviar atualização pro backend
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("edit-id").value;
        const nome = document.getElementById("edit-nome").value;
        const preco = document.getElementById("edit-preco").value;
        const categoria = document.getElementById("edit-categoria").value;
        const estoque = document.getElementById("edit-estoque").value;

        const res = await fetch(`/api/users/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ nome, preco, categoria, estoque }),
        });

        if (res.ok) {
          alert("Produto atualizado com sucesso!");
          modal.style.display = "none";
          location.reload();
        } else {
          alert("Erro ao atualizar produto!");
        }
      });
